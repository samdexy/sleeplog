<?php

namespace Drupal\Tests\jsonapi\Functional;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Url;
use Drupal\jsonapi\Normalizer\HttpExceptionNormalizer;
use Drupal\node\Entity\Node;
use Drupal\node\Entity\NodeType;
use Drupal\user\Entity\User;
use GuzzleHttp\RequestOptions;

/**
 * JSON:API integration test for the "Node" content entity type.
 *
 * @group jsonapi
 */
class NodeTest extends ResourceTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['node', 'path'];

  /**
   * {@inheritdoc}
   */
  protected static $entityTypeId = 'node';

  /**
   * {@inheritdoc}
   */
  protected static $resourceTypeName = 'node--camelids';

  /**
   * {@inheritdoc}
   *
   * @var \Drupal\node\NodeInterface
   */
  protected $entity;

  /**
   * {@inheritdoc}
   */
  protected static $patchProtectedFieldNames = [
    'revision_timestamp' => NULL,
    // @todo This is a relationship, and cannot be tested in the same way. Fix in https://www.drupal.org/project/jsonapi/issues/2939810.
    // 'revision_uid' => NULL,
    'created' => "The 'administer nodes' permission is required.",
    'changed' => NULL,
    'promote' => "The 'administer nodes' permission is required.",
    'sticky' => "The 'administer nodes' permission is required.",
    'path' => "The following permissions are required: 'create url aliases' OR 'administer url aliases'.",
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUpAuthorization($method) {
    switch ($method) {
      case 'GET':
        $this->grantPermissionsToTestedRole(['access content']);
        break;

      case 'POST':
        $this->grantPermissionsToTestedRole(['access content', 'create camelids content']);
        break;

      case 'PATCH':
        // Do not grant the 'create url aliases' permission to test the case
        // when the path field is protected/not accessible, see
        // \Drupal\Tests\rest\Functional\EntityResource\Term\TermResourceTestBase
        // for a positive test.
        $this->grantPermissionsToTestedRole(['access content', 'edit any camelids content']);
        break;

      case 'DELETE':
        $this->grantPermissionsToTestedRole(['access content', 'delete any camelids content']);
        break;
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function createEntity() {
    if (!NodeType::load('camelids')) {
      // Create a "Camelids" node type.
      NodeType::create([
        'name' => 'Camelids',
        'type' => 'camelids',
      ])->save();
    }

    // Create a "Llama" node.
    $node = Node::create(['type' => 'camelids']);
    $node->setTitle('Llama')
      ->setOwnerId($this->account->id())
      ->setPublished()
      ->setCreatedTime(123456789)
      ->setChangedTime(123456789)
      ->setRevisionCreationTime(123456789)
      ->set('path', '/llama')
      ->save();

    return $node;
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedDocument() {
    $author = User::load($this->entity->getOwnerId());
    $self_url = Url::fromUri('base:/jsonapi/node/camelids/' . $this->entity->uuid())->setAbsolute()->toString(TRUE)->getGeneratedUrl();
    return [
      'jsonapi' => [
        'meta' => [
          'links' => [
            'self' => ['href' => 'http://jsonapi.org/format/1.0/'],
          ],
        ],
        'version' => '1.0',
      ],
      'links' => [
        'self' => ['href' => $self_url],
      ],
      'data' => [
        'id' => $this->entity->uuid(),
        'type' => 'node--camelids',
        'links' => [
          'self' => ['href' => $self_url],
        ],
        'attributes' => [
          'created' => '1973-11-29T21:33:09+00:00',
          'changed' => (new \DateTime())->setTimestamp($this->entity->getChangedTime())->setTimezone(new \DateTimeZone('UTC'))->format(\DateTime::RFC3339),
          'default_langcode' => TRUE,
          'langcode' => 'en',
          'path' => [
            'alias' => '/llama',
            'pid' => 1,
            'langcode' => 'en',
          ],
          'promote' => TRUE,
          'revision_log' => NULL,
          'revision_timestamp' => '1973-11-29T21:33:09+00:00',
          // @todo Attempt to remove this in https://www.drupal.org/project/drupal/issues/2933518.
          'revision_translation_affected' => TRUE,
          'status' => TRUE,
          'sticky' => FALSE,
          'title' => 'Llama',
          'drupal_internal__nid' => 1,
          'drupal_internal__vid' => 1,
        ],
        'relationships' => [
          'node_type' => [
            'data' => [
              'id' => NodeType::load('camelids')->uuid(),
              'type' => 'node_type--node_type',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/node_type'],
              'self' => ['href' => $self_url . '/relationships/node_type'],
            ],
          ],
          'uid' => [
            'data' => [
              'id' => $author->uuid(),
              'type' => 'user--user',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/uid'],
              'self' => ['href' => $self_url . '/relationships/uid'],
            ],
          ],
          'revision_uid' => [
            'data' => [
              'id' => $author->uuid(),
              'type' => 'user--user',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/revision_uid'],
              'self' => ['href' => $self_url . '/relationships/revision_uid'],
            ],
          ],
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function getPostDocument() {
    return [
      'data' => [
        'type' => 'node--camelids',
        'attributes' => [
          'title' => 'Dramallama',
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedUnauthorizedAccessMessage($method) {
    switch ($method) {
      case 'GET':
      case 'PATCH':
      case 'DELETE':
        return "The 'access content' permission is required.";

      case 'POST':
        // @see \Drupal\node\NodeAccessControlHandler::createAccess() forbids access without providing a reason if the user doe
        return '';
    }
  }

  /**
   * Tests PATCHing a node's path with and without 'create url aliases'.
   *
   * For a positive test, see the similar test coverage for Term.
   *
   * @see \Drupal\Tests\jsonapi\Functional\TermTest::testPatchPath()
   * @see \Drupal\Tests\rest\Functional\EntityResource\Term\TermResourceTestBase::testPatchPath()
   */
  public function testPatchPath() {
    $this->setUpAuthorization('GET');
    $this->setUpAuthorization('PATCH');

    // @todo Remove line below in favor of commented line in https://www.drupal.org/project/jsonapi/issues/2878463.
    $url = Url::fromRoute(sprintf('jsonapi.%s.individual', static::$resourceTypeName), ['entity' => $this->entity->uuid()]);
    /* $url = $this->entity->toUrl('jsonapi'); */

    // GET node's current normalization.
    $response = $this->request('GET', $url, $this->getAuthenticationRequestOptions());
    $normalization = Json::decode((string) $response->getBody());

    // Change node's path alias.
    $normalization['data']['attributes']['path']['alias'] .= 's-rule-the-world';

    // Create node PATCH request.
    $request_options = $this->getAuthenticationRequestOptions();
    $request_options[RequestOptions::HEADERS]['Content-Type'] = 'application/vnd.api+json';
    $request_options[RequestOptions::BODY] = Json::encode($normalization);

    // PATCH request: 403 when creating URL aliases unauthorized.
    $response = $this->request('PATCH', $url, $request_options);
    // @todo Remove $expected + assertResourceResponse() in favor of the commented line below once https://www.drupal.org/project/jsonapi/issues/2943176 lands.
    $expected_document = [
      'jsonapi' => static::$jsonApiMember,
      'errors' => [
        [
          'title' => 'Forbidden',
          'status' => 403,
          'detail' => "The current user is not allowed to PATCH the selected field (path). The following permissions are required: 'create url aliases' OR 'administer url aliases'.",
          'links' => [
            'info' => ['href' => HttpExceptionNormalizer::getInfoUrl(403)],
            'via' => ['href' => $url->setAbsolute()->toString()],
          ],
          'source' => [
            'pointer' => '/data/attributes/path',
          ],
        ],
      ],
    ];
    $this->assertResourceResponse(403, $expected_document, $response);
    /* $this->assertResourceErrorResponse(403, "The current user is not allowed to PATCH the selected field (path). The following permissions are required: 'create url aliases' OR 'administer url aliases'.", $response, '/data/attributes/path'); */

    // Grant permission to create URL aliases.
    $this->grantPermissionsToTestedRole(['create url aliases']);

    // Repeat PATCH request: 200.
    $response = $this->request('PATCH', $url, $request_options);
    $this->assertResourceResponse(200, FALSE, $response);
    $updated_normalization = Json::decode((string) $response->getBody());
    $this->assertSame($normalization['data']['attributes']['path']['alias'], $updated_normalization['data']['attributes']['path']['alias']);
  }

  /**
   * {@inheritdoc}
   */
  public function testGetIndividual() {
    parent::testGetIndividual();

    // Unpublish node.
    $this->entity->setUnpublished()->save();

    // @todo Remove line below in favor of commented line in https://www.drupal.org/project/jsonapi/issues/2878463.
    $url = Url::fromRoute(sprintf('jsonapi.%s.individual', static::$resourceTypeName), ['entity' => $this->entity->uuid()]);
    /* $url = $this->entity->toUrl('jsonapi'); */
    $request_options = $this->getAuthenticationRequestOptions();

    // 403 when accessing own unpublished node.
    $response = $this->request('GET', $url, $request_options);
    // @todo Remove $expected + assertResourceResponse() in favor of the commented line below once https://www.drupal.org/project/jsonapi/issues/2943176 lands.
    $expected_document = [
      'jsonapi' => static::$jsonApiMember,
      'errors' => [
        [
          'title' => 'Forbidden',
          'status' => 403,
          'detail' => 'The current user is not allowed to GET the selected resource.',
          'links' => [
            'info' => ['href' => HttpExceptionNormalizer::getInfoUrl(403)],
            'via' => ['href' => $url->setAbsolute()->toString()],
          ],
          'source' => [
            'pointer' => '/data',
          ],
        ],
      ],
    ];
    $this->assertResourceResponse(
      403,
      $expected_document,
      $response,
      ['4xx-response', 'http_response', 'node:1'],
      ['user.permissions'],
      FALSE,
      'MISS'
    );
    /* $this->assertResourceErrorResponse(403, 'The current user is not allowed to GET the selected resource.', $response, '/data'); */

    // 200 after granting permission.
    $this->grantPermissionsToTestedRole(['view own unpublished content']);
    $response = $this->request('GET', $url, $request_options);
    // The response varies by 'user', causing the 'user.permissions' cache
    // context to be optimized away.
    $expected_cache_contexts = Cache::mergeContexts($this->getExpectedCacheContexts(), ['user']);
    $expected_cache_contexts = array_diff($expected_cache_contexts, ['user.permissions']);
    $this->assertResourceResponse(200, FALSE, $response, $this->getExpectedCacheTags(), $expected_cache_contexts, FALSE, 'UNCACHEABLE');
  }

  /**
   * {@inheritdoc}
   */
  protected static function getIncludePermissions() {
    return [
      'uid.node_type' => ['administer users'],
      'uid.roles' => ['administer permissions'],
    ];
  }

  /**
   * Creating relationships to missing resources should be 404 per JSON:API 1.1.
   *
   * @see https://github.com/json-api/json-api/issues/1033
   */
  public function testPostNonExistingAuthor() {
    $this->setUpAuthorization('POST');
    $this->grantPermissionsToTestedRole(['administer nodes']);

    $random_uuid = \Drupal::service('uuid')->generate();
    $doc = $this->getPostDocument();
    $doc['data']['relationships']['uid']['data'] = [
      'type' => 'user--user',
      'id' => $random_uuid,
    ];

    // Create node POST request.
    $url = Url::fromRoute(sprintf('jsonapi.%s.collection.post', static::$resourceTypeName));
    $request_options = $this->getAuthenticationRequestOptions();
    $request_options[RequestOptions::HEADERS]['Accept'] = 'application/vnd.api+json';
    $request_options[RequestOptions::HEADERS]['Content-Type'] = 'application/vnd.api+json';
    $request_options[RequestOptions::BODY] = Json::encode($doc);

    // POST request: 404 when adding relationships to non-existing resources.
    $response = $this->request('POST', $url, $request_options);
    $expected_document = [
      'errors' => [
        0 => [
          'status' => 404,
          'title' => 'Not Found',
          'detail' => "The resource identified by `user--user:$random_uuid` (given as a relationship item) could not be found.",
          'links' => [
            'info' => ['href' => HttpExceptionNormalizer::getInfoUrl(404)],
            'via' => ['href' => $url->setAbsolute()->toString()],
          ],
        ],
      ],
      'jsonapi' => static::$jsonApiMember,
    ];
    $this->assertResourceResponse(404, $expected_document, $response);
  }

}
