<?php

namespace Drupal\Tests\jsonapi\Functional;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Url;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\media\Entity\MediaType;
use Drupal\user\Entity\User;

/**
 * JSON:API integration test for the "Media" content entity type.
 *
 * @group jsonapi
 */
class MediaTest extends ResourceTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['media'];

  /**
   * {@inheritdoc}
   */
  protected static $entityTypeId = 'media';

  /**
   * {@inheritdoc}
   */
  protected static $resourceTypeName = 'media--camelids';

  /**
   * {@inheritdoc}
   *
   * @var \Drupal\media\MediaInterface
   */
  protected $entity;

  /**
   * {@inheritdoc}
   */
  protected static $patchProtectedFieldNames = [
    'changed' => NULL,
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUpAuthorization($method) {
    switch ($method) {
      case 'GET':
        $this->grantPermissionsToTestedRole(['view media']);
        break;

      case 'POST':
        $this->grantPermissionsToTestedRole(['create camelids media', 'access content']);
        break;

      case 'PATCH':
        $this->grantPermissionsToTestedRole(['edit any camelids media']);
        // @todo Remove this in https://www.drupal.org/node/2824851.
        $this->grantPermissionsToTestedRole(['access content']);
        break;

      case 'DELETE':
        $this->grantPermissionsToTestedRole(['delete any camelids media']);
        break;
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function createEntity() {
    if (!MediaType::load('camelids')) {
      // Create a "Camelids" media type.
      $media_type = MediaType::create([
        'name' => 'Camelids',
        'id' => 'camelids',
        'description' => 'Camelids are large, strictly herbivorous animals with slender necks and long legs.',
        'source' => 'file',
      ]);
      $media_type->save();
      // Create the source field.
      $source_field = $media_type->getSource()->createSourceField($media_type);
      $source_field->getFieldStorageDefinition()->save();
      $source_field->save();
      $media_type
        ->set('source_configuration', [
          'source_field' => $source_field->getName(),
        ])
        ->save();
    }

    // Create a file to upload.
    $file = File::create([
      'uri' => 'public://llama.txt',
    ]);
    $file->setPermanent();
    $file->save();

    // @see \Drupal\Tests\jsonapi\Functional\MediaTest::testPostIndividual()
    $post_file = File::create([
      'uri' => 'public://llama2.txt',
    ]);
    $post_file->setPermanent();
    $post_file->save();

    // Create a "Llama" media item.
    $media = Media::create([
      'bundle' => 'camelids',
      'field_media_file' => [
        'target_id' => $file->id(),
      ],
    ]);
    $media
      ->setName('Llama')
      ->setPublished()
      ->setCreatedTime(123456789)
      ->setOwnerId($this->account->id())
      ->setRevisionUserId($this->account->id())
      ->save();

    return $media;
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedDocument() {
    $file = File::load(1);
    $thumbnail = File::load(3);
    $author = User::load($this->entity->getOwnerId());
    $self_url = Url::fromUri('base:/jsonapi/media/camelids/' . $this->entity->uuid())->setAbsolute()->toString(TRUE)->getGeneratedUrl();
    $data = [
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
        'type' => 'media--camelids',
        'links' => [
          'self' => ['href' => $self_url],
        ],
        'attributes' => [
          'langcode' => 'en',
          'name' => 'Llama',
          'status' => TRUE,
          'created' => '1973-11-29T21:33:09+00:00',
          'changed' => (new \DateTime())->setTimestamp($this->entity->getChangedTime())->setTimezone(new \DateTimeZone('UTC'))->format(\DateTime::RFC3339),
          'revision_created' => (new \DateTime())->setTimestamp($this->entity->getRevisionCreationTime())->setTimezone(new \DateTimeZone('UTC'))->format(\DateTime::RFC3339),
          'default_langcode' => TRUE,
          'revision_log_message' => NULL,
          // @todo Attempt to remove this in https://www.drupal.org/project/drupal/issues/2933518.
          'revision_translation_affected' => TRUE,
          'drupal_internal__mid' => 1,
          'drupal_internal__vid' => 1,
        ],
        'relationships' => [
          'field_media_file' => [
            'data' => [
              'id' => $file->uuid(),
              'meta' => [
                'description' => NULL,
                'display' => NULL,
              ],
              'type' => 'file--file',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/field_media_file'],
              'self' => [
                'href' => $self_url . '/relationships/field_media_file',
              ],
            ],
          ],
          'thumbnail' => [
            'data' => [
              'id' => $thumbnail->uuid(),
              'meta' => [
                'alt' => '',
                'width' => 180,
                'height' => 180,
                'title' => NULL,
              ],
              'type' => 'file--file',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/thumbnail'],
              'self' => ['href' => $self_url . '/relationships/thumbnail'],
            ],
          ],
          'bundle' => [
            'data' => [
              'id' => MediaType::load('camelids')->uuid(),
              'type' => 'media_type--media_type',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/bundle'],
              'self' => ['href' => $self_url . '/relationships/bundle'],
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
          'revision_user' => [
            'data' => [
              'id' => $author->uuid(),
              'type' => 'user--user',
            ],
            'links' => [
              'related' => ['href' => $self_url . '/revision_user'],
              'self' => ['href' => $self_url . '/relationships/revision_user'],
            ],
          ],
        ],
      ],
    ];
    // @todo Make this unconditional when JSON:API requires Drupal 8.6 or newer.
    if (floatval(\Drupal::VERSION) < 8.6) {
      $data['data']['relationships']['thumbnail']['data']['meta']['alt'] = 'Thumbnail';
      $data['data']['relationships']['thumbnail']['data']['meta']['title'] = 'Llama';
    }
    return $data;
  }

  /**
   * {@inheritdoc}
   */
  protected function getPostDocument() {
    $file = File::load(2);
    return [
      'data' => [
        'type' => 'media--camelids',
        'attributes' => [
          'name' => 'Dramallama',
        ],
        'relationships' => [
          'field_media_file' => [
            'data' => [
              'id' => $file->uuid(),
              'meta' => [
                'description' => 'This file is better!',
                'display' => NULL,
              ],
              'type' => 'file--file',
            ],
          ],
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedUnauthorizedAccessMessage($method) {
    switch ($method) {
      case 'GET';
        return "The 'view media' permission is required and the media item must be published.";

      case 'POST':
        return "The following permissions are required: 'administer media' OR 'create media' OR 'create camelids media'.";

      case 'PATCH':
        // @todo Make this unconditional when JSON:API requires Drupal 8.6 or newer.
        if (floatval(\Drupal::VERSION) >= 8.6) {
          return "The following permissions are required: 'update any media' OR 'update own media' OR 'camelids: edit any media' OR 'camelids: edit own media'.";
        }

      case 'DELETE':
        // @todo Make this unconditional when JSON:API requires Drupal 8.6 or newer.
        if (floatval(\Drupal::VERSION) >= 8.6) {
          return "The following permissions are required: 'delete any media' OR 'delete own media' OR 'camelids: delete any media' OR 'camelids: delete own media'.";
        }

      default:
        return '';
    }
  }

  /**
   * {@inheritdoc}
   */
  protected function getExpectedUnauthorizedAccessCacheability() {
    // @see \Drupal\media\MediaAccessControlHandler::checkAccess()
    return parent::getExpectedUnauthorizedAccessCacheability()
      ->addCacheTags(['media:1']);
  }

  // @codingStandardsIgnoreStart
  /**
   * {@inheritdoc}
   */
  public function testPostIndividual() {
    // @todo Mimic \Drupal\Tests\rest\Functional\EntityResource\Media\MediaResourceTestBase::testPost()
    // @todo Later, use https://www.drupal.org/project/jsonapi/issues/2958554 to upload files rather than the REST module.
    parent::testPostIndividual();
  }
  // @codingStandardsIgnoreEnd

  /**
   * {@inheritdoc}
   *
   * @todo Determine if this override should be removed in https://www.drupal.org/project/jsonapi/issues/2952522
   */
  protected function getExpectedGetRelationshipDocumentData($relationship_field_name, EntityInterface $entity = NULL) {
    $data = parent::getExpectedGetRelationshipDocumentData($relationship_field_name, $entity);
    switch ($relationship_field_name) {
      case 'thumbnail':
        $data['meta'] = [
          'alt' => '',
          'width' => 180,
          'height' => 180,
          'title' => NULL,
        ];
        // @todo Make this unconditional when JSON:API requires Drupal 8.6 or newer.
        if (floatval(\Drupal::VERSION) < 8.6) {
          $data['meta']['alt'] = 'Thumbnail';
          $data['meta']['title'] = 'Llama';
        }
        return $data;

      case 'field_media_file':
        $data['meta'] = [
          'description' => NULL,
          'display' => NULL,
        ];
        return $data;

      default:
        return $data;
    }
  }

  /**
   * {@inheritdoc}
   *
   * @todo Remove this in https://www.drupal.org/node/2824851.
   */
  protected function doTestRelationshipMutation(array $request_options) {
    $this->grantPermissionsToTestedRole(['access content']);
    parent::doTestRelationshipMutation($request_options);
  }

}
